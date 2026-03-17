jest.mock("../../src/config/supabase", () => ({
    from: jest.fn(),
}));

const supabase = require("../../src/config/supabase");

const {
    createNotificationsService,
    getAllNotificationsService,
    getNotificationByIdService,
    updateNotificationService,
    deleteNotificationService,
} = require("../../src/services/notifications.service");

describe("notifications.service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("createNotificationsService should insert and return notification", async () => {
        const fakeNotification = { id: "1", title: "Reminder" };

        const single = jest.fn().mockResolvedValue({
            data: fakeNotification,
            error: null,
        });

        const select = jest.fn(() => ({ single }));
        const insert = jest.fn(() => ({ select }));

        supabase.from.mockReturnValue({ insert });

        const result = await createNotificationsService({ title: "Reminder" });

        expect(supabase.from).toHaveBeenCalledWith("notifications");
        expect(insert).toHaveBeenCalledWith({ title: "Reminder" });
        expect(result).toEqual(fakeNotification);
    });

    test("createNotificationsService should throw when supabase returns error", async () => {
        const single = jest.fn().mockResolvedValue({
            data: null,
            error: new Error("insert failed"),
        });

        const select = jest.fn(() => ({ single }));
        const insert = jest.fn(() => ({ select }));

        supabase.from.mockReturnValue({ insert });

        await expect(
            createNotificationsService({ title: "Reminder" })
        ).rejects.toThrow("insert failed");
    });

    test("getAllNotificationsService should apply filters, pagination and return data", async () => {
        const fakeRows = [
            { id: "1", title: "Reminder A" },
            { id: "2", title: "Reminder B" },
        ];

        const builder = {
            select: jest.fn(() => builder),
            eq: jest.fn(() => builder),
            order: jest.fn(() => builder),
            range: jest.fn(() =>
                Promise.resolve({
                    data: fakeRows,
                    error: null,
                    count: 2,
                })
            ),
        };

        supabase.from.mockReturnValue(builder);

        const result = await getAllNotificationsService({
            driver_id: "drv-1",
            admin_id: "adm-1",
            page: "2",
            limit: "5",
            sortOrder: "asc",
        });

        expect(supabase.from).toHaveBeenCalledWith("notifications");
        expect(builder.select).toHaveBeenCalledWith("*", { count: "exact" });
        expect(builder.eq).toHaveBeenCalledWith("driver_id", "drv-1");
        expect(builder.eq).toHaveBeenCalledWith("admin_id", "adm-1");
        expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: true });
        expect(builder.range).toHaveBeenCalledWith(5, 9);

        expect(result).toEqual({
            data: fakeRows,
            pagination: {
                page: 2,
                limit: 5,
                total: 2,
                totalPages: 1,
            },
        });
    });

    test("getAllNotificationsService should use default pagination and desc order", async () => {
        const builder = {
            select: jest.fn(() => builder),
            eq: jest.fn(() => builder),
            order: jest.fn(() => builder),
            range: jest.fn(() =>
                Promise.resolve({
                    data: [],
                    error: null,
                    count: 0,
                })
            ),
        };

        supabase.from.mockReturnValue(builder);

        const result = await getAllNotificationsService();

        expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: false });
        expect(builder.range).toHaveBeenCalledWith(0, 9);
        expect(result).toEqual({
            data: [],
            pagination: {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
            },
        });
    });

    test("getAllNotificationsService should throw when supabase returns error", async () => {
        const builder = {
            select: jest.fn(() => builder),
            eq: jest.fn(() => builder),
            order: jest.fn(() => builder),
            range: jest.fn(() =>
                Promise.resolve({
                    data: null,
                    error: new Error("query failed"),
                    count: 0,
                })
            ),
        };

        supabase.from.mockReturnValue(builder);

        await expect(getAllNotificationsService()).rejects.toThrow("query failed");
    });

    test("getNotificationByIdService should return null when not found", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: null,
            error: null,
        });

        const eq = jest.fn(() => ({ maybeSingle }));
        const select = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ select });

        const result = await getNotificationByIdService("abc");

        expect(result).toBeNull();
    });

    test("getNotificationByIdService should return notification when found", async () => {
        const fakeNotification = { id: "abc", title: "Reminder" };

        const maybeSingle = jest.fn().mockResolvedValue({
            data: fakeNotification,
            error: null,
        });

        const eq = jest.fn(() => ({ maybeSingle }));
        const select = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ select });

        const result = await getNotificationByIdService("abc");

        expect(eq).toHaveBeenCalledWith("id", "abc");
        expect(result).toEqual(fakeNotification);
    });

    test("getNotificationByIdService should throw when id is missing", async () => {
        await expect(getNotificationByIdService()).rejects.toThrow("id is required");
    });

    test("getNotificationByIdService should throw when supabase returns error", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: null,
            error: new Error("read failed"),
        });

        const eq = jest.fn(() => ({ maybeSingle }));
        const select = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ select });

        await expect(getNotificationByIdService("abc")).rejects.toThrow("read failed");
    });

    test("updateNotificationService should update and return record", async () => {
        const updated = { id: "1", title: "Updated reminder" };

        const single = jest.fn().mockResolvedValue({
            data: updated,
            error: null,
        });

        const select = jest.fn(() => ({ single }));
        const eq = jest.fn(() => ({ select }));
        const update = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ update });

        const result = await updateNotificationService("1", {
            title: "Updated reminder",
        });

        expect(update).toHaveBeenCalledWith({ title: "Updated reminder" });
        expect(eq).toHaveBeenCalledWith("id", "1");
        expect(result).toEqual(updated);
    });

    test("updateNotificationService should throw when id is missing", async () => {
        await expect(updateNotificationService()).rejects.toThrow("id is required");
    });

    test("updateNotificationService should throw when supabase returns error", async () => {
        const single = jest.fn().mockResolvedValue({
            data: null,
            error: new Error("update failed"),
        });

        const select = jest.fn(() => ({ single }));
        const eq = jest.fn(() => ({ select }));
        const update = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ update });

        await expect(
            updateNotificationService("1", { title: "Updated reminder" })
        ).rejects.toThrow("update failed");
    });

    test("deleteNotificationService should delete and return success", async () => {
        const eq = jest.fn().mockResolvedValue({ error: null });
        const del = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ delete: del });

        const result = await deleteNotificationService("1");

        expect(del).toHaveBeenCalled();
        expect(eq).toHaveBeenCalledWith("id", "1");
        expect(result).toEqual({ success: true });
    });

    test("deleteNotificationService should throw when id is missing", async () => {
        await expect(deleteNotificationService()).rejects.toThrow("id is required");
    });

    test("deleteNotificationService should throw when supabase returns error", async () => {
        const eq = jest.fn().mockResolvedValue({
            error: new Error("delete failed"),
        });
        const del = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ delete: del });

        await expect(deleteNotificationService("1")).rejects.toThrow("delete failed");
    });
});