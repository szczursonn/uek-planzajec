import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        BASE_URL: z
            .string()
            .url(),
        NODE_ENV: z
            .enum(["development", "test", "production"])
            .default("development"),
    },
    client: {
        // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
    },
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
        BASE_URL: process.env.BASE_URL
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
