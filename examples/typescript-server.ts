import { ConnectRouter } from "@bufbuild/connect";
import { fastify } from "fastify";
import { fastifyConnectPlugin } from "@bufbuild/connect-fastify";
import { IdentityService } from "../gen/ts/identity/identity_connect";
import {
  CreateUserRequest,
  UserResponse,
  GetUserRequest,
  LoginRequest,
  LoginResponse,
  User,
  VerifyUserRequest,
  VerifyUserResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  UpdateUserRequest,
} from "../gen/ts/identity/identity_pb";
import { Timestamp } from "@bufbuild/protobuf";

// In-memory user store for the example
const users = new Map<number, User>();
let nextId = 1;

// Register the IdentityService
function registerRoutes(router: ConnectRouter) {
  router.service(IdentityService, {
    // Create a new user
    async createUser(request: CreateUserRequest): Promise<UserResponse> {
      const id = nextId++;
      const now = new Date();
      const timestamp = Timestamp.fromDate(now);
      
      const user = new User({
        id,
        phone: request.phone,
        email: request.email,
        isActive: true,
        isVerified: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      
      users.set(id, user);
      
      return new UserResponse({
        user,
      });
    },
    
    // Get user by ID
    async getUser(request: GetUserRequest): Promise<UserResponse> {
      const user = users.get(request.id);
      if (!user) {
        throw new Error(`User with ID ${request.id} not found`);
      }
      
      return new UserResponse({
        user,
      });
    },
    
    // Update an existing user
    async updateUser(request: UpdateUserRequest): Promise<UserResponse> {
      const user = users.get(request.id);
      if (!user) {
        throw new Error(`User with ID ${request.id} not found`);
      }
      
      if (request.phone !== undefined) {
        user.phone = request.phone;
      }
      
      if (request.email !== undefined) {
        user.email = request.email;
      }
      
      if (request.isActive !== undefined) {
        user.isActive = request.isActive;
      }
      
      user.updatedAt = Timestamp.fromDate(new Date());
      users.set(request.id, user);
      
      return new UserResponse({
        user,
      });
    },
    
    // Delete a user
    async deleteUser(request: DeleteUserRequest): Promise<DeleteUserResponse> {
      const exists = users.has(request.id);
      if (exists) {
        users.delete(request.id);
      }
      
      return new DeleteUserResponse({
        success: exists,
      });
    },
    
    // Login a user
    async login(request: LoginRequest): Promise<LoginResponse> {
      // Find user by email (in a real implementation, you would check passwords)
      let foundUser: User | undefined;
      for (const user of users.values()) {
        if (user.email === request.email) {
          foundUser = user;
          break;
        }
      }
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      return new LoginResponse({
        token: "example-jwt-token-" + foundUser.id,
        user: foundUser,
      });
    },
    
    // Verify a user
    async verifyUser(request: VerifyUserRequest): Promise<VerifyUserResponse> {
      // Find user by email
      let foundUser: User | undefined;
      for (const user of users.values()) {
        if (user.email === request.email) {
          foundUser = user;
          break;
        }
      }
      
      if (!foundUser) {
        throw new Error("User not found");
      }
      
      // In a real implementation, you would validate the verification code
      if (request.verificationCode === "123456") {
        foundUser.isVerified = true;
        users.set(foundUser.id, foundUser);
        
        return new VerifyUserResponse({
          success: true,
        });
      }
      
      return new VerifyUserResponse({
        success: false,
      });
    },
  });
}

// Create and start the server
async function main() {
  const server = fastify();
  await server.register(fastifyConnectPlugin, {
    routes: registerRoutes,
  });
  
  await server.listen({ port: 8080, host: "0.0.0.0" });
  console.log("Server listening on http://localhost:8080");
}

main().catch(console.error);