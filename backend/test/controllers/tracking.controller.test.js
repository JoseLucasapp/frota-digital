jest.mock("../../src/services/tracking.service", () => ({
  createTrackingLogService: jest.fn(),
  getTrackingLogsService: jest.fn(),
  getTrackingOverviewService: jest.fn(),
}));

const {
  createTrackingLogService,
  getTrackingLogsService,
  getTrackingOverviewService,
} = require("../../src/services/tracking.service");

const {
  createTrackingLogController,
  getTrackingLogsController,
  getTrackingOverviewController,
} = require("../../src/controllers/tracking.controller");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("tracking.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTrackingLogController", () => {
    it("should return 201 and created tracking data", async () => {
      const req = {
        body: {
          vehicle_id: "vehicle-1",
          latitude: -6.88,
          longitude: -38.56,
        },
        user: {
          id: "admin-1",
          role: "ADMIN",
        },
      };
      const res = mockResponse();

      const createdLog = {
        id: "tracking-1",
        vehicle_id: "vehicle-1",
      };

      createTrackingLogService.mockResolvedValue(createdLog);

      await createTrackingLogController(req, res);

      expect(createTrackingLogService).toHaveBeenCalledWith(req.body, req.user);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdLog,
      });
    });

    it("should return custom error status when create service fails", async () => {
      const req = {
        body: {},
        user: {
          id: "admin-1",
          role: "ADMIN",
        },
      };
      const res = mockResponse();

      const error = new Error("vehicle_id é obrigatório");
      error.statusCode = 400;

      createTrackingLogService.mockRejectedValue(error);

      await createTrackingLogController(req, res);

      expect(createTrackingLogService).toHaveBeenCalledWith(req.body, req.user);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "vehicle_id é obrigatório",
      });
    });

    it("should return 500 when create service fails without statusCode", async () => {
      const req = {
        body: {},
        user: {
          id: "admin-1",
          role: "ADMIN",
        },
      };
      const res = mockResponse();

      createTrackingLogService.mockRejectedValue(new Error("unexpected error"));

      await createTrackingLogController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "unexpected error",
      });
    });
  });

  describe("getTrackingLogsController", () => {
    it("should return 200 with logs result", async () => {
      const req = {
        query: {
          vehicle_id: "vehicle-1",
          page: "1",
          limit: "20",
        },
        user: {
          id: "admin-1",
          role: "ADMIN",
        },
      };
      const res = mockResponse();

      const logsResult = {
        data: [{ id: "tracking-1", vehicle_id: "vehicle-1" }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      getTrackingLogsService.mockResolvedValue(logsResult);

      await getTrackingLogsController(req, res);

      expect(getTrackingLogsService).toHaveBeenCalledWith(req.query, req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(logsResult);
    });

    it("should return custom error status when logs service fails", async () => {
      const req = {
        query: {},
        user: {
          id: "admin-1",
          role: "ADMIN",
        },
      };
      const res = mockResponse();

      const error = new Error("forbidden");
      error.statusCode = 403;

      getTrackingLogsService.mockRejectedValue(error);

      await getTrackingLogsController(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "forbidden",
      });
    });
  });

  describe("getTrackingOverviewController", () => {
    it("should return 200 with overview result", async () => {
      const req = {
        query: { limit: "100" },
        user: {
          id: "admin-1",
          role: "ADMIN",
        },
      };
      const res = mockResponse();

      const overviewResult = {
        data: [
          {
            id: "vehicle-1",
            plate: "ABC-1234",
            tracking_status: "ok",
          },
        ],
      };

      getTrackingOverviewService.mockResolvedValue(overviewResult);

      await getTrackingOverviewController(req, res);

      expect(getTrackingOverviewService).toHaveBeenCalledWith(req.query, req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(overviewResult);
    });

    it("should return 500 when overview service fails without statusCode", async () => {
      const req = {
        query: {},
        user: {
          id: "admin-1",
          role: "ADMIN",
        },
      };
      const res = mockResponse();

      getTrackingOverviewService.mockRejectedValue(new Error("db error"));

      await getTrackingOverviewController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "db error",
      });
    });
  });
});