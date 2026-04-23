jest.mock("../../src/controllers/tracking.controller", () => ({
  createTrackingLogController: jest.fn(),
  getTrackingLogsController: jest.fn(),
  getTrackingOverviewController: jest.fn(),
}));

jest.mock("../../src/middlewares/attachUser.middleware", () => ({
  attachUser: jest.fn((req, res, next) => next && next()),
}));

jest.mock("../../src/utils/jwt", () => ({
  requireAuth: jest.fn((req, res, next) => next && next()),
}));

const {
  createTrackingLogController,
  getTrackingLogsController,
  getTrackingOverviewController,
} = require("../../src/controllers/tracking.controller");

const { attachUser } = require("../../src/middlewares/attachUser.middleware");
const { requireAuth } = require("../../src/utils/jwt");

const registerTrackingRoutes = require("../../src/routes/tracking.routes");

describe("tracking.routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register GET /tracking/logs with requireAuth, attachUser and handler", () => {
    const router = {
      get: jest.fn(),
      post: jest.fn(),
    };

    registerTrackingRoutes(router);

    expect(router.get).toHaveBeenCalledWith(
      "/tracking/logs",
      requireAuth,
      attachUser,
      expect.any(Function)
    );
  });

  it("should register GET /tracking/overview with requireAuth, attachUser and handler", () => {
    const router = {
      get: jest.fn(),
      post: jest.fn(),
    };

    registerTrackingRoutes(router);

    expect(router.get).toHaveBeenCalledWith(
      "/tracking/overview",
      requireAuth,
      attachUser,
      expect.any(Function)
    );
  });

  it("should register POST /tracking/logs with requireAuth, attachUser and handler", () => {
    const router = {
      get: jest.fn(),
      post: jest.fn(),
    };

    registerTrackingRoutes(router);

    expect(router.post).toHaveBeenCalledWith(
      "/tracking/logs",
      requireAuth,
      attachUser,
      expect.any(Function)
    );
  });

  it("should call getTrackingLogsController from GET /tracking/logs handler", async () => {
    const router = {
      get: jest.fn(),
      post: jest.fn(),
    };

    registerTrackingRoutes(router);

    const getLogsCall = router.get.mock.calls.find(
      (call) => call[0] === "/tracking/logs"
    );

    const handler = getLogsCall[3];

    const req = { query: {}, user: { id: "admin-1" } };
    const res = {};

    await handler(req, res);

    expect(getTrackingLogsController).toHaveBeenCalledWith(req, res);
  });

  it("should call getTrackingOverviewController from GET /tracking/overview handler", async () => {
    const router = {
      get: jest.fn(),
      post: jest.fn(),
    };

    registerTrackingRoutes(router);

    const overviewCall = router.get.mock.calls.find(
      (call) => call[0] === "/tracking/overview"
    );

    const handler = overviewCall[3];

    const req = { query: {}, user: { id: "admin-1" } };
    const res = {};

    await handler(req, res);

    expect(getTrackingOverviewController).toHaveBeenCalledWith(req, res);
  });

  it("should call createTrackingLogController from POST /tracking/logs handler", async () => {
    const router = {
      get: jest.fn(),
      post: jest.fn(),
    };

    registerTrackingRoutes(router);

    const postCall = router.post.mock.calls.find(
      (call) => call[0] === "/tracking/logs"
    );

    const handler = postCall[3];

    const req = { body: {}, user: { id: "admin-1" } };
    const res = {};

    await handler(req, res);

    expect(createTrackingLogController).toHaveBeenCalledWith(req, res);
  });
});