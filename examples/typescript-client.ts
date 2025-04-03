import { createPromiseClient } from "@bufbuild/connect";
import { createConnectTransport } from "@bufbuild/connect-node";
import { IdentityService } from "../gen/ts/identity/identity_connect";
import { CreateUserRequest, LoginRequest } from "../gen/ts/identity/identity_pb";

// Create a Connect transport
const transport = createConnectTransport({
  baseUrl: "http://localhost:8080",
});

// Create client
const client = createPromiseClient(IdentityService, transport);

async function createUser() {
  try {
    const request = new CreateUserRequest({
      phone: "+1234567890",
      email: "user@example.com",
      password: "securepassword",
    });

    const response = await client.createUser(request);
    console.log("User created:", response.user);
  } catch (error) {
    console.error("Error creating user:", error);
  }
}

async function login() {
  try {
    const request = new LoginRequest({
      email: "user@example.com",
      password: "securepassword",
    });

    const response = await client.login(request);
    console.log("Login successful. Token:", response.token);
    console.log("User info:", response.user);
  } catch (error) {
    console.error("Error logging in:", error);
  }
}

// Example usage
createUser().then(() => login());