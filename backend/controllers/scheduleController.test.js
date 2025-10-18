const mongoose = require('mongoose');
const Schedule = require('../models/Schedule');
const Zone = require('../models/Zone');
const Vehicle = require('../models/Vehicle');
const { createSchedule, assignResources } = require('./scheduleController');

// Mock the models and other dependencies
jest.mock('../models/Schedule');
jest.mock('../models/Zone');
jest.mock('../models/Vehicle');

// Mock the catchAsync wrapper
jest.mock('../utils/catchAsync', () => (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
});

// Mock AppError
jest.mock('../utils/appError', () => {
  return class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
    }
  };
});

describe('Schedule Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
      params: { id: 'schedule-id' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createSchedule', () => {
    beforeEach(() => {
      req.body = {
        zone: 'zone-id',
        wasteType: 'general',
        collectionDay: 'monday',
        timeSlot: {
          start: '08:00',
          end: '12:00'
        },
        route: 'Route description',
        frequency: 'weekly',
        estimatedDuration: 60
      };

      Zone.findById = jest.fn().mockResolvedValue({ _id: 'zone-id', name: 'Zone 1' });
      Schedule.findOne = jest.fn().mockResolvedValue(null);
      Schedule.create = jest.fn().mockResolvedValue({ _id: 'new-schedule-id' });
      Schedule.findById = jest.fn().mockResolvedValue({
        _id: 'new-schedule-id',
        zone: { _id: 'zone-id', name: 'Zone 1', code: 'Z1' },
        wasteType: 'general',
        collectionDay: 'monday',
        timeSlot: { start: '08:00', end: '12:00' }
      });
    });

    it('should handle string array format of assignedCrew', async () => {
      // Test with a stringified array with single quotes
      req.body.assignedCrew = "[ '01', '02' ]";
      
      await createSchedule(req, res, next);
      
      expect(Schedule.create).toHaveBeenCalled();
      const createArgs = Schedule.create.mock.calls[0][0];
      expect(Array.isArray(createArgs.assignedCrew)).toBe(true);
      expect(createArgs.assignedCrew).toEqual(['01', '02']);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('assignResources', () => {
    beforeEach(() => {
      req.body = {
        assignedVehicle: 'vehicle-id'
      };

      const mockSchedule = {
        _id: 'schedule-id',
        save: jest.fn().mockResolvedValue(true)
      };

      Schedule.findById = jest.fn().mockResolvedValue(mockSchedule);
      Vehicle.findById = jest.fn().mockResolvedValue({ _id: 'vehicle-id' });
    });

    it('should handle string array format of assignedCrew', async () => {
      // Test with a stringified array with single quotes
      req.body.assignedCrew = "[ '01', '02' ]";
      
      await assignResources(req, res, next);
      
      const mockSchedule = Schedule.findById.mock.results[0].value;
      expect(mockSchedule.save).toHaveBeenCalled();
      expect(Array.isArray(mockSchedule.assignedCrew)).toBe(true);
      expect(mockSchedule.assignedCrew).toEqual(['01', '02']);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });
});