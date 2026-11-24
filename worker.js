
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Check that the API is working
    if (url.pathname === "/api/health" && request.method === "GET") {
      return Response.json({
        status: "ok",
        service: "Solos Mobile API"
      });
    }

    // Receive a new repair booking
    if (url.pathname === "/api/bookings" && request.method === "POST") {
      try {
        const booking = await request.json();

        const name = typeof booking.name === "string" ? booking.name.trim() : "";
        const email = typeof booking.email === "string" ? booking.email.trim().toLowerCase() : "";
        const phone = typeof booking.phone === "string" ? booking.phone.trim() : "";
        const device = typeof booking.device === "string" ? booking.device.trim() : "";
        const service = typeof booking.service === "string" ? booking.service.trim() : "";
        const preferredDate = typeof booking.preferredDate === "string" ? booking.preferredDate.trim() : "";
        const message = typeof booking.message === "string" ? booking.message.trim() : "";

        if (!name || !email || !phone || !device || !service) {
          return Response.json(
            { message: "Please complete all required fields." },
            { status: 400 }
          );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return Response.json(
            { message: "Please enter a valid email address." },
            { status: 400 }
          );
        }

        if (
          name.length > 100 ||
          email.length > 150 ||
          phone.length > 40 ||
          device.length > 100 ||
          service.length > 100 ||
          preferredDate.length > 30 ||
          message.length > 1500
        ) {
          return Response.json(
            { message: "One or more fields are too long." },
            { status: 400 }
          );
        }

        const id = `SM-${crypto.randomUUID()}`;
        const createdAt = new Date().toISOString();

        await env.DB.prepare(`
          INSERT INTO bookings (
            id,
            name,
            email,
            phone,
            device,
            service,
            preferred_date,
            message,
            status,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)
        `).bind(
          id,
          name,
          email,
          phone,
          device,
          service,
          preferredDate,
          message,
          createdAt
        ).run();

        return Response.json(
          {
            message: "Your repair request has been received.",
            bookingId: id
          },
          { status: 201 }
        );

      } catch (error) {
        return Response.json(
          { message: "Could not save your request. Please try again." },
          { status: 500 }
        );
      }
    }

    // Reject unknown API routes
    if (url.pathname.startsWith("/api/")) {
      return Response.json(
        { message: "API route not found." },
        { status: 404 }
      );
    }

    // Serve the existing website files
    return env.ASSETS.fetch(request);
  }
};
