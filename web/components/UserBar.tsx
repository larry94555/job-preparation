import { auth, signOut } from "@/auth";

/**
 * Small signed-in-user indicator + Sign out control. Server component: reads the
 * session and posts to a server action that calls signOut(). Renders nothing if
 * somehow unauthenticated (pages already redirect in that case).
 */
export default async function UserBar() {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  return (
    <div
      className="row"
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 10,
        marginTop: 0,
        fontSize: 13,
      }}
    >
      <span className="muted">
        Signed in as <strong>{user.name || user.email}</strong>
        {user.role === "admin" ? " · admin" : ""}
      </span>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button className="btn ghost mini" type="submit">
          Sign out
        </button>
      </form>
    </div>
  );
}
