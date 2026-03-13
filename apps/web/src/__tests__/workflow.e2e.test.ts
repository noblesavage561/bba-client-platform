import { POST as intakePost } from "@/app/api/intake/route";
import { POST as registerPost } from "@/app/api/auth/register/route";

type MockPrisma = {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  client: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  intakeSubmission: {
    create: jest.Mock;
  };
  checklistItem: {
    findMany: jest.Mock;
    createMany: jest.Mock;
  };
  notification: {
    create: jest.Mock;
  };
};

jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    client: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    intakeSubmission: {
      create: jest.fn(),
    },
    checklistItem: {
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
  },
}));

const { prisma: mockPrisma } = jest.requireMock("@/lib/db") as { prisma: MockPrisma };

function createJsonRequest(payload: unknown): Request {
  return {
    json: async () => payload,
  } as unknown as Request;
}

describe("Intake and Registration workflow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("completes intake, advances stage, seeds checklist, and requires registration when password is missing", async () => {
    const userId = "user-1";
    const clientId = "client-1";

    mockPrisma.user.findUnique.mockResolvedValue({
      id: userId,
      email: "owner@acme.com",
      hashedPassword: null,
      client: { id: clientId },
    });

    mockPrisma.intakeSubmission.create.mockResolvedValue({ id: "submission-1" });
    mockPrisma.client.update.mockResolvedValue({
      userId,
      businessName: "Acme Holdings",
    });
    mockPrisma.checklistItem.findMany.mockResolvedValue([]);
    mockPrisma.checklistItem.createMany.mockResolvedValue({ count: 5 });
    mockPrisma.notification.create.mockResolvedValue({ id: "notif-1" });

    const response = await intakePost(
      createJsonRequest({
        clientId: "pending",
        answers: {
          businessName: "Acme Holdings",
          ownerName: "Casey Owner",
          ownerEmail: "owner@acme.com",
          ownerPhone: "555-222-1212",
          businessType: "LLC",
          industry: "Consulting / Professional Services",
          state: "TX",
          annualRevenue: "100k-250k",
          businessBankAccount: "yes",
          creditScore: "medium",
          fundingAmount: "50000",
          fundingTimeline: "asap",
          previousFundingAttempts: "never",
          fundingPurpose: ["qbi"],
          availableDocuments: ["w2"],
        },
        step: 5,
        completed: true,
      }) as never
    );

    expect(response.status).toBe(201);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.requiresRegistration).toBe(true);
    expect(json.clientId).toBe(clientId);
    expect(mockPrisma.client.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: clientId },
        data: { stage: "INTAKE" },
      })
    );
    expect(mockPrisma.checklistItem.createMany).toHaveBeenCalled();
    expect(mockPrisma.notification.create).toHaveBeenCalled();
  });

  it("registers intake user by setting hashed password and returns success", async () => {
    const userId = "user-2";

    mockPrisma.user.findUnique.mockResolvedValue({
      id: userId,
      email: "new.user@acme.com",
      name: "New User",
      hashedPassword: null,
      client: { id: "client-2" },
    });
    mockPrisma.user.update.mockResolvedValue({ id: userId, email: "new.user@acme.com" });
    mockPrisma.client.update.mockResolvedValue({ id: "client-2" });
    mockPrisma.notification.create.mockResolvedValue({ id: "notif-2" });

    const response = await registerPost(
      createJsonRequest({
        email: "new.user@acme.com",
        password: "StrongPass123",
        businessName: "Acme Holdings",
      }) as never
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: userId },
        data: expect.objectContaining({
          hashedPassword: expect.any(String),
        }),
      })
    );
  });
});