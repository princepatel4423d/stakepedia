import AuditLog from "../models/AuditLog.model.js";

/**
 * logAudit(action, resource, options?)
 *
 * Middleware factory — attach AFTER the route handler has run
 * by calling it directly inside the controller via createAuditLog(),
 * OR use auditMiddleware() as an express middleware on sensitive routes.
 */
export const createAuditLog = async ({
  adminId,
  action,
  resource,
  resourceId = null,
  resourceName = null,
  oldData = null,
  newData = null,
  metadata = {},
  ip = null,
  userAgent = null,
  status = "success",
  errorMessage = null,
}) => {
  try {
    await AuditLog.create({
      admin: adminId,
      action,
      resource,
      resourceId,
      resourceName,
      oldData,
      newData,
      metadata,
      ip,
      userAgent,
      status,
      errorMessage,
    });
  } catch (err) {
    console.error("Audit log error:", err.message);
  }
};

// Express middleware — auto-log after response on admin routes
export const auditMiddleware = (action, resource) => async (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = async (body) => {
    // Only log successful mutations
    if (
      body?.success &&
      ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
    ) {
      await createAuditLog({
        adminId:      req.admin?._id,
        action,
        resource,
        resourceId:   body?.data?._id || req.params?.id || null,
        resourceName: body?.data?.name || body?.data?.title || body?.data?.email || null,
        newData:      ["POST", "PUT", "PATCH"].includes(req.method) ? req.body : null,
        metadata:     { method: req.method, path: req.originalUrl, params: req.params },
        ip:           req.ip || req.headers["x-forwarded-for"],
        userAgent:    req.headers["user-agent"],
        status:       "success",
      });
    }
    return originalJson(body);
  };

  next();
};