import express from "express";
import axios from "axios";

const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const PAYPAL_API = "https://api-m.sandbox.paypal.com";

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
  throw new Error("Missing required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, PAYPAL_CLIENT_ID, or PAYPAL_SECRET");
}

// Fetch all packages from Supabase REST API
router.get("/packages", async (req, res) => {
  try {
    const packageUrl = `${SUPABASE_URL}/rest/v1/packages?select=name,price,duration_days`;
    console.log("Fetch packages - Query URL:", packageUrl);
    const response = await axios.get(packageUrl, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      timeout: 5000,
    });
    console.log("Fetched packages from Supabase:", response.data);
    res.json(response.data);
  } catch (err) {
    console.error("❌ Fetch packages error:", {
      message: err.message,
      response: err.response?.data,
    });
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// Create PayPal order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, package_name } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    if (!package_name || typeof package_name !== "string") {
      return res.status(400).json({ error: "Invalid or missing package_name" });
    }

    // Validate package exists
    const packageUrl = `${SUPABASE_URL}/rest/v1/packages?select=id&name=ilike.${encodeURIComponent(package_name.trim().toLowerCase())}`;
    console.log("Create order - Package query URL:", packageUrl);
    const packageResponse = await axios.get(packageUrl, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      timeout: 5000,
    });
    console.log("Create order - Package response:", packageResponse.data);
    if (!packageResponse.data[0]) {
      return res.status(404).json({ error: `Package '${package_name}' not found` });
    }

    const accessToken = await getAccessToken();

    const order = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: parseFloat(amount).toFixed(2),
            },
            description: `Purchase of ${package_name} package`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    if (order.data && order.data.id) {
      res.json({ orderID: order.data.id });
    } else {
      res.status(500).json({ error: "Failed to create PayPal order" });
    }
  } catch (err) {
    console.error("❌ Create order error:", {
      message: err.message,
      response: err.response?.data,
      requestBody: req.body,
    });
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Capture PayPal order and assign package
router.post("/capture-order/:orderId", async (req, res) => {
  console.log(`Capture order request: orderId=${req.params.orderId}, body=`, req.body);
  const { orderId } = req.params;

  if (!req.body) {
    console.error("Request body is undefined");
    return res.status(400).json({ error: "Request body is missing" });
  }

  const { user_id, package_name } = req.body;
  if (!user_id || !package_name) {
    console.error("Missing fields in request body:", { user_id, package_name });
    return res.status(400).json({ error: "Missing user_id or package_name" });
  }

  const authHeader = req.headers.authorization || "";
  console.log("Authorization header:", authHeader);
  const userAccessToken = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  console.log("Extracted userAccessToken:", userAccessToken);

  if (!userAccessToken) {
    return res.status(401).json({ error: "User access token missing" });
  }

  try {
    const accessToken = await getAccessToken();

    const capture = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      }
    );
    console.log("PayPal capture response:", capture.data);

    if (capture.data.status !== "COMPLETED") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    // Fetch package details
    const packageUrl = `${SUPABASE_URL}/rest/v1/packages?select=id,price,duration_days&name=ilike.${encodeURIComponent(package_name.trim().toLowerCase())}`;
    console.log("Capture order - Package query URL:", packageUrl);
    let packageResponse;
    try {
      packageResponse = await axios.get(packageUrl, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${userAccessToken}`,
        },
        timeout: 5000,
      });
      console.log("Supabase package response (authenticated):", packageResponse.data);
    } catch (authError) {
      console.error("Authenticated package query failed:", authError.message, authError.response?.data);
      return res.status(401).json({ error: "Invalid or expired access token" });
    }

    const pkg = packageResponse.data[0];
    if (!pkg) {
      return res.status(404).json({ error: `Package '${package_name}' not found` });
    }

    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + (pkg.duration_days || 30));

    // Insert into user_packages
    const insertResponse = await axios.post(
      `${SUPABASE_URL}/rest/v1/user_packages`,
      {
        user_id,
        package_id: pkg.id,
        start_date: now.toISOString(),
        end_date: end.toISOString(),
      },
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${userAccessToken}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        timeout: 5000,
      }
    );

    if (insertResponse.status !== 201) {
      throw new Error("Failed to assign package");
    }

    res.json({ message: "Package assigned and payment captured" });
  } catch (err) {
    console.error("❌ Capture order error:", {
      message: err.message,
      response: err.response?.data,
      orderId,
      user_id,
      package_name,
    });
    res.status(500).json({ error: "Failed to capture order or assign package" });
  }
});

async function getAccessToken() {
  const res = await axios({
    url: `${PAYPAL_API}/v1/oauth2/token`,
    method: "post",
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_SECRET,
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: "grant_type=client_credentials",
    timeout: 5000,
  });
  return res.data.access_token;
}

export default router;