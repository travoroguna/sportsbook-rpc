# Sportsbook RPC

This repository contains gRPC service definitions for the Sportsbook application.

## Available Services

- **Identity Service**: User management, authentication, and verification

## How to Generate Code

1. Ensure you have Go and Node.js installed
2. Run the generation script:

```bash
./generate.sh
```

This will:
- Install required dependencies
- Generate Go and TypeScript code from proto files
- Update the Go module and create a Node.js package.json if needed

## How to Import and Use

### In Go Projects

Add this module as a dependency:

```bash
go get github.com/travoroguna/sportsbook-rpc
```

Then import the generated packages:

```go
import (
    identitypb "github.com/travoroguna/sportsbook-rpc/gen/go/identity"
    "google.golang.org/grpc"
)

// Example: Create a client
conn, err := grpc.Dial("your-server:port", grpc.WithInsecure())
client := identitypb.NewIdentityServiceClient(conn)

// Example: Call a method
response, err := client.CreateUser(context.Background(), &identitypb.CreateUserRequest{
    Phone: "+1234567890",
    Email: "user@example.com",
    Password: "securepassword",
})
```

### In TypeScript/Node.js Projects

Add this module as a dependency:

```bash
npm install /path/to/sportsbook-rpc
# or from git repository
npm install github:travoroguna/sportsbook-rpc
```

Then import the generated packages:

```typescript
import { createPromiseClient } from "@bufbuild/connect";
import { createConnectTransport } from "@bufbuild/connect-node";
import { IdentityService } from "sportsbook-rpc/gen/ts/identity/identity_connect";
import { CreateUserRequest } from "sportsbook-rpc/gen/ts/identity/identity_pb";

// Create a client
const transport = createConnectTransport({
  baseUrl: "http://localhost:8080",
});
const client = createPromiseClient(IdentityService, transport);

// Call a method
const response = await client.createUser(new CreateUserRequest({
  phone: "+1234567890",
  email: "user@example.com",
  password: "securepassword",
}));
```

## Examples

Example implementations are available in the `examples/` directory:

- `typescript-client.ts`: Example TypeScript client
- `typescript-server.ts`: Example TypeScript server implementation

To run the examples:

```bash
cd examples
npm install
npm run start:server  # In one terminal
npm run start:client  # In another terminal
```