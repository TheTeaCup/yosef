import { z } from "zod";

const EventCoordinatorSchema = z.object({
  type: z.literal("eventCoordinator"),

  email: z.email(),
  name: z.string().min(1),
  organization: z.string().min(1),
});

const StaffMemberSchema = z.object({
  type: z.literal("staffMember"),

  email: z.email(),
  name: z.string().min(1),
  linkedin: z.url(),

  hoursPerWeek: z.string().min(1),
  onlineTimes: z.string().min(1),

  whyStaff: z.string().min(20),

  argumentativeMember: z.string().min(20),
  staffMisconduct: z.string().min(20),
  memberDispute: z.string().min(20),

  additionalInfo: z.string().optional(),
});

export type EventApp = z.infer<typeof EventCoordinatorSchema>;
export type StaffApp = z.infer<typeof StaffMemberSchema>;

export { EventCoordinatorSchema, StaffMemberSchema };
