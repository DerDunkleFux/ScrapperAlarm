
export default defineEventHandler(async (event): Promise<
    { success: true, data: string } | { success: false, error: string }> => {

        // 1. Read the incoming POST request body
        const body = await readBody(event);
        const { userId, name, start, end, startDate } = body;

        // Validate the inputs roughly
        if (!name || !userId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields: userId and name are mandatory.',
            });
        }

        try {
            // 2. Perform the database insertion wrapped in a Promise so Nitro awaits it correctly
            await new Promise((resolve, reject) => {
                const query = `
        INSERT INTO alarms (user_id, name, start_time, end_time, start_date)
        VALUES (?, ?, ?, ?, ?)
      `;

                db.run(query, [userId, name, start, end, startDate], function (err: any) {
                    if (err) {
                        return reject(err);
                    }
                    // 'this.lastID' gives you the auto-incremented ID of the row just inserted
                    resolve(this.lastID);
                });
            });

            // 3. Return a successful JSON response back to the scraper frontend
            return {
                success: true,
                data: 'Alarm logged successfully into SQLite DB.',
            };

        } catch (error: any) {
            console.error('Database insertion error:', error);
            throw createError({
                statusCode: 500,
                statusMessage: `Database error: ${error.message}`,
            });
        }
    });
