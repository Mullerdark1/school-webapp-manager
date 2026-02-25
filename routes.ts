import { z } from 'zod';
import { insertStudentSchema, insertClassSchema, insertAttendanceSchema, students, classes, attendance, userRoles } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  students: {
    list: {
      method: 'GET' as const,
      path: '/api/students',
      input: z.object({
        search: z.string().optional(),
        classId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()), // z.custom<StudentWithClass>() - simplfying for template
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/students/:id',
      responses: {
        200: z.custom<typeof students.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/students',
      input: insertStudentSchema,
      responses: {
        201: z.custom<typeof students.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/students/:id',
      input: insertStudentSchema.partial(),
      responses: {
        200: z.custom<typeof students.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/students/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  classes: {
    list: {
      method: 'GET' as const,
      path: '/api/classes',
      responses: {
        200: z.array(z.custom<typeof classes.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/classes',
      input: insertClassSchema,
      responses: {
        201: z.custom<typeof classes.$inferSelect>(),
      },
    },
  },
  attendance: {
    mark: {
      method: 'POST' as const,
      path: '/api/attendance',
      input: z.object({
        classId: z.number(),
        date: z.string(), // YYYY-MM-DD
        records: z.array(z.object({
          studentId: z.number(),
          status: z.enum(["present", "absent", "late"]),
        })),
      }),
      responses: {
        201: z.object({ message: z.string() }),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/attendance',
      input: z.object({
        classId: z.coerce.number(),
        date: z.string(),
      }),
      responses: {
        200: z.array(z.custom<typeof attendance.$inferSelect>()),
      },
    },
  },
  roles: {
    assign: {
        method: 'POST' as const,
        path: '/api/roles',
        input: z.object({
            userId: z.string(),
            role: z.enum(["admin", "teacher", "student"]),
        }),
        responses: {
            200: z.custom<typeof userRoles.$inferSelect>(),
        },
    },
    get: {
        method: 'GET' as const,
        path: '/api/roles/me',
        responses: {
            200: z.object({ role: z.enum(["admin", "teacher", "student"]).nullable() }),
        }
    }
  },
  dashboard: {
      stats: {
          method: 'GET' as const,
          path: '/api/dashboard/stats',
          responses: {
              200: z.object({
                  totalStudents: z.number(),
                  totalClasses: z.number(),
                  presentToday: z.number(),
              })
          }
      }
  },
  files: {
      upload: {
          method: 'POST' as const,
          path: '/api/upload',
          // Input is multipart/form-data, not easily validated by Zod body parser here, handled by multer
          responses: {
              201: z.object({ url: z.string() }),
              400: errorSchemas.validation,
          }
      }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
