import { Button } from "@/components/ui/button";
import { pb } from "@/config/pocketbaseConfig";
import { useUsersStore } from "@/modules/auth/users/usersStore";

export const UsersPage = () => {
  const usersStore = useUsersStore();
  return (
    <div>
      <pre>{JSON.stringify(usersStore.data, undefined, 2)}</pre>
      <br />{" "}
      <Button
        onClick={async () => {
          const resp = await pb.collection("users").getFullList();
          console.log(resp);
        }}
      >
        click me
      </Button>
    </div>
  );
};
export default UsersPage;
