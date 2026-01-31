import { fromIsoDateTime, UserSchema } from "@aquora/shared";

export default function Page() {
  const example = UserSchema.parse({
    id: "user_123",
    name: "Ada Lovelace",
    createdAt: new Date().toISOString()
  });

  const createdAt = fromIsoDateTime(example.createdAt);

  return (
    <main>
      <h1>aquora</h1>
      <p>
        Shared Zod schema parsed users: <strong>{example.name}</strong>
      </p>
      <p>Created at (Date): {createdAt.toUTCString()}</p>
    </main>
  );
}

