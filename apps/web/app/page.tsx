import { fromIsoDateTime, UserSchema } from "@aquora/shared";

export default function Page() {
  const example = UserSchema.parse({
    id: "user_123",
    fullName: "Ada Lovelace",
    mobileNumber: "94767804166",
    role: "METER_READER",
    preferredLanguage: "EN",
    isActive: true,
    createdAt: new Date().toISOString()
  });

  const createdAt = fromIsoDateTime(example.createdAt);

  return (
    <main>
      <h1>aquora</h1>
      <p>
        Shared Zod schema parsed users: <strong>{example.fullName}</strong>
      </p>
      <p>Created at (Date): {createdAt.toUTCString()}</p>
    </main>
  );
}
