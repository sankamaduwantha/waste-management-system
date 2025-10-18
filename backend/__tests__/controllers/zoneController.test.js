const mongoose = require('mongoose');
const Zone = require('../../models/Zone');
const Bin = require('../../models/Bin');
const AppError = require('../../utils/appError');

// Mock catchAsync to directly execute the wrapped function
jest.mock('../../utils/catchAsync', () => 
  fn => async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// Import controller after mocking dependencies
const { getZoneStatistics } = require('../../controllers/zoneController');

// Mocking Express request and response
const mockRequest = (params = {}) => ({
  params
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock data
const mockZoneId = new mongoose.Types.ObjectId();
const mockZone = {
  _id: mockZoneId,
  name: 'Central District',
  code: 'CD-001',
  area: 25.5,
  population: 45000,
  toObject: function() { return this; }
};

// Mocks for Bin aggregation results
const mockBinStats = [
  {
    _id: 'general',
    count: 15,
    avgFillLevel: 65.2,
    fullBins: 3
  },
  {
    _id: 'recyclable',
    count: 10,
    avgFillLevel: 42.8,
    fullBins: 1
  }
];

describe('Zone Controller - getZoneStatistics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if zone is not found', async () => {
    // Mock Zone.findById to return null
    Zone.findById = jest.fn().mockResolvedValue(null);
    
    const req = mockRequest({ id: mockZoneId.toString() });
    const res = mockResponse();
    const next = jest.fn();

    await getZoneStatistics(req, res, next);
    
    expect(Zone.findById).toHaveBeenCalledWith(mockZoneId.toString());
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Zone not found');
    expect(error.statusCode).toBe(404);
  });

  it('should return zone statistics when zone exists', async () => {
    // Mock Zone.findById to return a zone
    Zone.findById = jest.fn().mockResolvedValue(mockZone);
    
    // Mock Bin aggregation
    Bin.aggregate = jest.fn().mockResolvedValue(mockBinStats);
    
    // Mock Bin.countDocuments for the three different calls
    Bin.countDocuments = jest.fn()
      .mockResolvedValueOnce(25)  // Total bins
      .mockResolvedValueOnce(4)   // Full bins
      .mockResolvedValueOnce(2);  // Damaged bins
    
    const req = mockRequest({ id: mockZoneId.toString() });
    const res = mockResponse();
    const next = jest.fn();

    await getZoneStatistics(req, res, next);
    
    // Verify Zone.findById was called with the correct id
    expect(Zone.findById).toHaveBeenCalledWith(mockZoneId.toString());
    
    // Verify Bin.aggregate was called with the correct parameters
    expect(Bin.aggregate).toHaveBeenCalled();
    const aggregateArgs = Bin.aggregate.mock.calls[0][0];
    expect(aggregateArgs[0].$match).toEqual({ zone: mockZone._id });
    
    // Verify Bin.countDocuments was called three times
    expect(Bin.countDocuments).toHaveBeenCalledTimes(3);
    
    // First call should be for total bins
    expect(Bin.countDocuments.mock.calls[0][0]).toEqual({ zone: mockZone._id });
    
    // Second call should be for full bins
    expect(Bin.countDocuments.mock.calls[1][0]).toEqual({ 
      zone: mockZone._id, 
      currentFillLevel: { $gte: 90 } 
    });
    
    // Third call should be for damaged bins
    expect(Bin.countDocuments.mock.calls[2][0]).toEqual({ 
      zone: mockZone._id, 
      status: 'damaged' 
    });
    
    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.status).toBe('success');
    expect(responseData.data.zone.name).toBe('Central District');
    expect(responseData.data.bins.total).toBe(25);
    expect(responseData.data.bins.full).toBe(4);
    expect(responseData.data.bins.damaged).toBe(2);
    
    // Calculate expected density (population/area)
    const expectedDensity = (mockZone.population / mockZone.area).toFixed(2);
    expect(responseData.data.density).toBe(expectedDensity);
    
    // Verify next was not called (no error)
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle zero area to prevent division by zero', async () => {
    // Create a mock zone with zero area
    const zeroAreaZone = {
      ...mockZone,
      area: 0,
      toObject: function() { return this; }
    };
    
    // Mock Zone.findById to return a zone with zero area
    Zone.findById = jest.fn().mockResolvedValue(zeroAreaZone);
    
    // Mock Bin aggregation
    Bin.aggregate = jest.fn().mockResolvedValue(mockBinStats);
    
    // Mock Bin.countDocuments for the three different calls
    Bin.countDocuments = jest.fn()
      .mockResolvedValueOnce(25)  // Total bins
      .mockResolvedValueOnce(4)   // Full bins
      .mockResolvedValueOnce(2);  // Damaged bins
    
    const req = mockRequest({ id: mockZoneId.toString() });
    const res = mockResponse();
    const next = jest.fn();

    await getZoneStatistics(req, res, next);
    
    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    
    // Verify the density calculation handles zero area
    const responseData = res.json.mock.calls[0][0].data;
    expect(responseData.density).toBe(0);
  });

  it('should handle errors during execution', async () => {
    // Mock Zone.findById to throw an error
    const errorMessage = 'Database connection error';
    Zone.findById = jest.fn().mockRejectedValue(new Error(errorMessage));
    
    const req = mockRequest({ id: mockZoneId.toString() });
    const res = mockResponse();
    const next = jest.fn();

    await getZoneStatistics(req, res, next);
    
    // Verify that next was called with the error
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(errorMessage);
  });
});