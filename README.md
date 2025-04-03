# Sportsbook RPC

This repository contains gRPC service definitions for the Sportsbook application.

## Available Services

- **Identity Service**: User management, authentication, and verification

## How to Generate Code

1. Ensure you have Go installed
2. Run the generation script:

```bash
./generate.sh
```

This will:
- Install required dependencies
- Generate Go code from proto files
- Update the Go module

## How to Import and Use

### In Go Projects

Add this module as a dependency:

```bash
go get github.com/sportsbook/sportsbook-rpc
```

Then import the generated packages:

```go
import (
    identitypb "github.com/sportsbook/sportsbook-rpc/gen/go/identity"
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

### Implementing Servers

```go
import (
    identitypb "github.com/sportsbook/sportsbook-rpc/gen/go/identity"
    "google.golang.org/grpc"
)

// Implement the service interface
type identityServer struct {
    identitypb.UnimplementedIdentityServiceServer
}

// Implement methods
func (s *identityServer) CreateUser(ctx context.Context, req *identitypb.CreateUserRequest) (*identitypb.UserResponse, error) {
    // Implementation goes here
}

// Register with gRPC server
func RegisterServices(s *grpc.Server) {
    identitypb.RegisterIdentityServiceServer(s, &identityServer{})
}
```