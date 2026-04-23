jest.mock("../../src/config/supabase", () => ({
  from: jest.fn(),
}));

jest.mock("../../src/services/scope.service", () => ({
  ensureAdminScope: jest.fn(),
}));

const supabase = require("../../src/config/supabase");
const { ensureAdminScope } = require("../../src/services/scope.service");

const {
  createTrackingLogService,
  getTrackingLogsService,
  getTrackingOverviewService,
} = require("../../src/services/tracking.service");


const makeQueryBuilder = (finalResult) => {
  const builder = {};

  builder.select = jest.fn().mockReturnValue(builder);
  builder.eq = jest.fn().mockReturnValue(builder);
  builder.gte = jest.fn().mockReturnValue(builder);
  builder.lte = jest.fn().mockReturnValue(builder);
  builder.order = jest.fn().mockReturnValue(builder);
  builder.limit = jest.fn().mockReturnValue(builder);
  builder.range = jest.fn().mockReturnValue(builder);
  builder.in = jest.fn().mockReturnValue(builder);
  builder.insert = jest.fn().mockReturnValue(builder);
  builder.update = jest.fn().mockReturnValue(builder);

  builder.single = jest.fn().mockResolvedValue(finalResult);
  builder.maybeSingle = jest.fn().mockResolvedValue(finalResult);

  builder.then = (resolve, reject) => Promise.resolve(finalResult).then(resolve, reject);
  builder.catch = (reject) => Promise.resolve(finalResult).catch(reject);
  builder.finally = (onFinally) => Promise.resolve(finalResult).finally(onFinally);

  return builder;
};

describe("tracking.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTrackingLogService", () => {
    it("should throw 400 when vehicle_id is missing", async () => {
      await expect(
        createTrackingLogService(
          { address: "Rua A" },
          { id: "admin-1", role: "ADMIN" }
        )
      ).rejects.toMatchObject({
        message: "vehicle_id é obrigatório",
        statusCode: 400,
      });
    });

    it("should throw 400 when no location and no address are provided", async () => {
      await expect(
        createTrackingLogService(
          { vehicle_id: "vehicle-1" },
          { id: "admin-1", role: "ADMIN" }
        )
      ).rejects.toMatchObject({
        message: "Informe a localização pelo navegador ou digite um endereço",
        statusCode: 400,
      });
    });

    it("should throw 400 when latitude is invalid", async () => {
      await expect(
        createTrackingLogService(
          {
            vehicle_id: "vehicle-1",
            latitude: "abc",
            longitude: -38.56,
          },
          { id: "admin-1", role: "ADMIN" }
        )
      ).rejects.toMatchObject({
        message: "latitude/longitude inválidos",
        statusCode: 400,
      });
    });

    it("should throw 400 when only one coordinate is provided", async () => {
      await expect(
        createTrackingLogService(
          {
            vehicle_id: "vehicle-1",
            latitude: -6.88,
          },
          { id: "admin-1", role: "ADMIN" }
        )
      ).rejects.toMatchObject({
        message: "latitude e longitude devem ser informados juntas",
        statusCode: 400,
      });
    });

    it("should create tracking log for ADMIN and update vehicle", async () => {
      ensureAdminScope.mockReturnValue("admin-1");

      const vehicleBuilder = makeQueryBuilder({
        data: {
          id: "vehicle-1",
          admin_id: "admin-1",
          plate: "ABC-1234",
          make: "Fiat",
          model: "Uno",
        },
        error: null,
      });

      const insertBuilder = makeQueryBuilder({
        data: {
          id: "tracking-1",
          vehicle_id: "vehicle-1",
          admin_id: "admin-1",
        },
        error: null,
      });

      const updateBuilder = makeQueryBuilder({
        error: null,
      });

      supabase.from
        .mockReturnValueOnce(vehicleBuilder)
        .mockReturnValueOnce(insertBuilder)
        .mockReturnValueOnce(updateBuilder);

      const result = await createTrackingLogService(
        {
          vehicle_id: "vehicle-1",
          latitude: -6.88,
          longitude: -38.56,
          address: "Rua Teste",
          notes: "Obs",
        },
        {
          id: "admin-1",
          role: "ADMIN",
        }
      );

      expect(ensureAdminScope).toHaveBeenCalledWith({ id: "admin-1", role: "ADMIN" });

      expect(vehicleBuilder.eq).toHaveBeenNthCalledWith(1, "id", "vehicle-1");
      expect(vehicleBuilder.eq).toHaveBeenNthCalledWith(2, "admin_id", "admin-1");

      expect(insertBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          vehicle_id: "vehicle-1",
          admin_id: "admin-1",
          driver_id: null,
          latitude: -6.88,
          longitude: -38.56,
          address: "Rua Teste",
          source: "browser_geolocation",
          notes: "Obs",
        })
      );

      expect(updateBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          last_latitude: -6.88,
          last_longitude: -38.56,
          last_address: "Rua Teste",
          last_tracking_source: "browser_geolocation",
        })
      );

      expect(updateBuilder.eq).toHaveBeenCalledWith("id", "vehicle-1");
      expect(result).toEqual({
        id: "tracking-1",
        vehicle_id: "vehicle-1",
        admin_id: "admin-1",
      });
    });

    it("should create tracking log for DRIVER using loan admin_id and driver id", async () => {
      const vehicleBuilder = makeQueryBuilder({
        data: {
          id: "vehicle-1",
          admin_id: "admin-999",
          plate: "ABC-1234",
          make: "Fiat",
          model: "Uno",
        },
        error: null,
      });

      const loanBuilder = makeQueryBuilder({
        data: {
          id: "loan-1",
          admin_id: "admin-1",
          start_date: "2026-01-01T00:00:00.000Z",
          end_date: null,
        },
        error: null,
      });

      const insertBuilder = makeQueryBuilder({
        data: {
          id: "tracking-1",
          vehicle_id: "vehicle-1",
          admin_id: "admin-1",
          driver_id: "driver-1",
        },
        error: null,
      });

      const updateBuilder = makeQueryBuilder({
        error: null,
      });

      supabase.from
        .mockReturnValueOnce(vehicleBuilder)
        .mockReturnValueOnce(loanBuilder)
        .mockReturnValueOnce(insertBuilder)
        .mockReturnValueOnce(updateBuilder);

      const result = await createTrackingLogService(
        {
          vehicle_id: "vehicle-1",
          address: "Rua Manual",
        },
        {
          id: "driver-1",
          role: "DRIVER",
        }
      );

      expect(loanBuilder.eq).toHaveBeenNthCalledWith(1, "vehicle_id", "vehicle-1");
      expect(loanBuilder.eq).toHaveBeenNthCalledWith(2, "driver_id", "driver-1");

      expect(insertBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          vehicle_id: "vehicle-1",
          admin_id: "admin-1",
          driver_id: "driver-1",
          address: "Rua Manual",
          source: "manual",
        })
      );

      expect(result).toEqual({
        id: "tracking-1",
        vehicle_id: "vehicle-1",
        admin_id: "admin-1",
        driver_id: "driver-1",
      });
    });

    it("should throw 403 when driver is not linked to vehicle", async () => {
      const vehicleBuilder = makeQueryBuilder({
        data: {
          id: "vehicle-1",
          admin_id: "admin-1",
          plate: "ABC-1234",
          make: "Fiat",
          model: "Uno",
        },
        error: null,
      });

      const loanBuilder = makeQueryBuilder({
        data: null,
        error: null,
      });

      supabase.from
        .mockReturnValueOnce(vehicleBuilder)
        .mockReturnValueOnce(loanBuilder);

      await expect(
        createTrackingLogService(
          {
            vehicle_id: "vehicle-1",
            address: "Rua Teste",
          },
          {
            id: "driver-1",
            role: "DRIVER",
          }
        )
      ).rejects.toMatchObject({
        message: "Motorista não vinculado a este veículo",
        statusCode: 403,
      });
    });
  });

  describe("getTrackingLogsService", () => {
    it("should return paginated tracking logs for ADMIN", async () => {
      ensureAdminScope.mockReturnValue("admin-1");

      const logsBuilder = makeQueryBuilder({
        data: [{ id: "tracking-1", vehicle_id: "vehicle-1" }],
        error: null,
        count: 1,
      });

      supabase.from.mockReturnValueOnce(logsBuilder);

      const result = await getTrackingLogsService(
        {
          page: "1",
          limit: "20",
          vehicle_id: "vehicle-1",
          source: "manual",
          start_date: "2026-04-01T00:00:00.000Z",
          end_date: "2026-04-30T23:59:59.000Z",
        },
        {
          id: "admin-1",
          role: "ADMIN",
        }
      );

      expect(logsBuilder.select).toHaveBeenCalledWith("*", { count: "exact" });
      expect(logsBuilder.eq).toHaveBeenCalledWith("admin_id", "admin-1");
      expect(logsBuilder.eq).toHaveBeenCalledWith("vehicle_id", "vehicle-1");
      expect(logsBuilder.eq).toHaveBeenCalledWith("source", "manual");
      expect(logsBuilder.gte).toHaveBeenCalled();
      expect(logsBuilder.lte).toHaveBeenCalled();
      expect(logsBuilder.order).toHaveBeenCalledWith("recorded_at", { ascending: false });
      expect(logsBuilder.range).toHaveBeenCalledWith(0, 19);

      expect(result).toEqual({
        data: [{ id: "tracking-1", vehicle_id: "vehicle-1" }],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it("should filter logs by driver_id when user is DRIVER", async () => {
      const logsBuilder = makeQueryBuilder({
        data: [],
        error: null,
        count: 0,
      });

      supabase.from.mockReturnValueOnce(logsBuilder);

      await getTrackingLogsService(
        { page: "1", limit: "10" },
        { id: "driver-1", role: "DRIVER" }
      );

      expect(logsBuilder.eq).toHaveBeenCalledWith("driver_id", "driver-1");
    });

    it("should cap limit to MAX_LIMIT", async () => {
      const logsBuilder = makeQueryBuilder({
        data: [],
        error: null,
        count: 0,
      });

      supabase.from.mockReturnValueOnce(logsBuilder);

      const result = await getTrackingLogsService(
        { page: "1", limit: "9999" },
        { id: "admin-1", role: "ADMIN" }
      );

      expect(result.pagination.limit).toBe(500);
      expect(logsBuilder.range).toHaveBeenCalledWith(0, 499);
    });
  });

  describe("getTrackingOverviewService", () => {
    it("should return overview with driver, loan and tracking_status", async () => {
      ensureAdminScope.mockReturnValue("admin-1");

      const freshTrackedAt = new Date(Date.now() - 30 * 60 * 1000).toISOString();

      const vehiclesBuilder = makeQueryBuilder({
        data: [
          {
            id: "vehicle-1",
            plate: "ABC-1234",
            make: "Fiat",
            model: "Uno",
            status: "active",
            admin_id: "admin-1",
            last_latitude: -6.88,
            last_longitude: -38.56,
            last_address: "Rua Teste",
            last_tracked_at: freshTrackedAt,
            last_tracking_source: "manual",
          },
        ],
        error: null,
      });

      const loansBuilder = makeQueryBuilder({
        data: [
          {
            id: "loan-1",
            vehicle_id: "vehicle-1",
            driver_id: "driver-1",
            start_date: "2026-04-20T00:00:00.000Z",
            end_date: null,
            admin_id: "admin-1",
          },
        ],
        error: null,
      });

      const driversBuilder = makeQueryBuilder({
        data: [
          {
            id: "driver-1",
            name: "José",
            phone: "83999999999",
            admin_id: "admin-1",
          },
        ],
        error: null,
      });

      supabase.from
        .mockReturnValueOnce(vehiclesBuilder)
        .mockReturnValueOnce(loansBuilder)
        .mockReturnValueOnce(driversBuilder);

      const result = await getTrackingOverviewService(
        { limit: "100" },
        { id: "admin-1", role: "ADMIN" }
      );

      expect(vehiclesBuilder.eq).toHaveBeenCalledWith("admin_id", "admin-1");
      expect(loansBuilder.eq).toHaveBeenCalledWith("admin_id", "admin-1");
      expect(driversBuilder.eq).toHaveBeenCalledWith("admin_id", "admin-1");

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          id: "vehicle-1",
          tracking_status: "ok",
          driver: expect.objectContaining({
            id: "driver-1",
            name: "José",
          }),
          loan: expect.objectContaining({
            id: "loan-1",
            vehicle_id: "vehicle-1",
          }),
        })
      );
    });

    it("should return offline when vehicle has no last_tracked_at", async () => {
      const vehiclesBuilder = makeQueryBuilder({
        data: [
          {
            id: "vehicle-1",
            plate: "ABC-1234",
            make: "Fiat",
            model: "Uno",
            status: "active",
            admin_id: "admin-1",
            last_latitude: null,
            last_longitude: null,
            last_address: null,
            last_tracked_at: null,
            last_tracking_source: null,
          },
        ],
        error: null,
      });

      const loansBuilder = makeQueryBuilder({
        data: [],
        error: null,
      });

      supabase.from
        .mockReturnValueOnce(vehiclesBuilder)
        .mockReturnValueOnce(loansBuilder);

      const result = await getTrackingOverviewService(
        {},
        { id: "admin-1", role: "ADMIN" }
      );

      expect(result.data[0].tracking_status).toBe("offline");
      expect(result.data[0].driver).toBeNull();
      expect(result.data[0].loan).toBeNull();
    });

    it("should skip loans and drivers queries when there are no vehicles", async () => {
      const vehiclesBuilder = makeQueryBuilder({
        data: [],
        error: null,
      });

      supabase.from.mockReturnValueOnce(vehiclesBuilder);

      const result = await getTrackingOverviewService(
        {},
        { id: "admin-1", role: "ADMIN" }
      );

      expect(supabase.from).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: [] });
    });
  });
});