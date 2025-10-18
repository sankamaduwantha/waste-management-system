const mongoose = require('mongoose');
const { createSchedule } = require('../../controllers/scheduleController');
const Schedule = require('../../models/Schedule');
const Zone = require('../../models/Zone');
const Vehicle = require('../../models/Vehicle');
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

// Mocking mongoose models
jest.mock('../../models/Schedule');
jest.mock('../../models/Zone');
jest.mock('../../models/Vehicle');

// Mock request and response
const mockRequest = (body = {}) => ({
  body
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Schedule Controller - createSchedule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a schedule with properly processed assignedCrew', async () => {
    // Mock data
    const mockZoneId = new mongoose.Types.ObjectId();
    const mockVehicleId = new mongoose.Types.ObjectId();
    const mockCrewId1 = new mongoose.Types.ObjectId();
    const mockCrewId2 = new mongoose.Types.ObjectId();

    // Mock request body
    const reqBody = {
      zone: mockZoneId,
      wasteType: 'recyclable',
      collectionDay: 'monday',
      timeSlot: {
        start: '08:00',
        end: '10:00'
      },
      route: 'Route description',
      assignedVehicle: mockVehicleId,
      // This simulates the problematic format that was causing errors
      assignedCrew: `[ '${mockCrewId1}', '${mockCrewId2}' ]`,
      frequency: 'weekly',
      estimatedDuration: 120
    };

    // Mock Zone.findById
    Zone.findById = jest.fn().mockResolvedValue({ _id: mockZoneId });

    // Mock Vehicle.findById
    Vehicle.findById = jest.fn().mockResolvedValue({ _id: mockVehicleId });

    // Mock Schedule.findOne (no conflicts)
    Schedule.findOne = jest.fn().mockResolvedValue(null);

    // Mock Schedule.create
    const mockCreatedSchedule = { _id: new mongoose.Types.ObjectId() };
    Schedule.create = jest.fn().mockResolvedValue(mockCreatedSchedule);

    // Mock Schedule.findById for the populated response
    Schedule.findById = jest.fn().mockResolvedValue({
      _id: mockCreatedSchedule._id,
      zone: { name: 'Test Zone', code: 'TZ-001' },
      assignedVehicle: { vehicleNumber: 'V-001', type: 'truck' },
      assignedCrew: [
        { name: 'Crew Member 1', email: 'crew1@example.com' },
        { name: 'Crew Member 2', email: 'crew2@example.com' }
      ]
    });

    const req = mockRequest(reqBody);
    const res = mockResponse();
    const next = jest.fn();

    await createSchedule(req, res, next);

    // Check that Schedule.create was called with properly processed assignedCrew
    expect(Schedule.create).toHaveBeenCalled();
    
    // Get the arguments passed to Schedule.create
    const createArgs = Schedule.create.mock.calls[0][0];
    
    // Verify assignedCrew is an array (not a string)
    expect(Array.isArray(createArgs.assignedCrew)).toBe(true);
    
    // Verify response
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
    expect(res.json.mock.calls[0][0].success).toBe(true);
    
    // Verify next wasn't called with an error
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle when assignedCrew is already an array', async () => {
    // Mock data
    const mockZoneId = new mongoose.Types.ObjectId();
    const mockCrewId1 = new mongoose.Types.ObjectId();
    const mockCrewId2 = new mongoose.Types.ObjectId();

    // Mock request body with assignedCrew as array
    const reqBody = {
      zone: mockZoneId,
      wasteType: 'recyclable',
      collectionDay: 'monday',
      timeSlot: {
        start: '08:00',
        end: '10:00'
      },
      assignedCrew: [mockCrewId1, mockCrewId2]
    };

    // Mock Zone.findById
    Zone.findById = jest.fn().mockResolvedValue({ _id: mockZoneId });

    // Mock Schedule.findOne (no conflicts)
    Schedule.findOne = jest.fn().mockResolvedValue(null);

    // Mock Schedule.create
    const mockCreatedSchedule = { _id: new mongoose.Types.ObjectId() };
    Schedule.create = jest.fn().mockResolvedValue(mockCreatedSchedule);

    // Mock Schedule.findById for the populated response
    Schedule.findById = jest.fn().mockResolvedValue({
      _id: mockCreatedSchedule._id,
      zone: { name: 'Test Zone', code: 'TZ-001' }
    });

    const req = mockRequest(reqBody);
    const res = mockResponse();
    const next = jest.fn();

    await createSchedule(req, res, next);

    // Check that Schedule.create was called with the array unchanged
    expect(Schedule.create).toHaveBeenCalled();
    
    // Get the arguments passed to Schedule.create
    const createArgs = Schedule.create.mock.calls[0][0];
    
    // Verify assignedCrew is still an array
    expect(Array.isArray(createArgs.assignedCrew)).toBe(true);
    expect(createArgs.assignedCrew).toEqual([mockCrewId1, mockCrewId2]);
    
    // Verify response
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('should handle when assignedCrew is a single string', async () => {
    // Mock data
    const mockZoneId = new mongoose.Types.ObjectId();
    const mockCrewId = new mongoose.Types.ObjectId().toString();

    // Mock request body with assignedCrew as single string
    const reqBody = {
      zone: mockZoneId,
      wasteType: 'recyclable',
      collectionDay: 'monday',
      timeSlot: {
        start: '08:00',
        end: '10:00'
      },
      assignedCrew: mockCrewId
    };

    // Mock Zone.findById
    Zone.findById = jest.fn().mockResolvedValue({ _id: mockZoneId });

    // Mock Schedule.findOne (no conflicts)
    Schedule.findOne = jest.fn().mockResolvedValue(null);

    // Mock Schedule.create
    const mockCreatedSchedule = { _id: new mongoose.Types.ObjectId() };
    Schedule.create = jest.fn().mockResolvedValue(mockCreatedSchedule);

    // Mock Schedule.findById for the populated response
    Schedule.findById = jest.fn().mockResolvedValue({
      _id: mockCreatedSchedule._id,
      zone: { name: 'Test Zone', code: 'TZ-001' }
    });

    const req = mockRequest(reqBody);
    const res = mockResponse();
    const next = jest.fn();

    await createSchedule(req, res, next);

    // Check that Schedule.create was called with the string converted to array
    expect(Schedule.create).toHaveBeenCalled();
    
    // Get the arguments passed to Schedule.create
    const createArgs = Schedule.create.mock.calls[0][0];
    
    // Verify assignedCrew is an array containing the single ID
    expect(Array.isArray(createArgs.assignedCrew)).toBe(true);
    expect(createArgs.assignedCrew).toEqual([mockCrewId]);
    
    // Verify response
    expect(res.status).toHaveBeenCalledWith(201);
  });
});