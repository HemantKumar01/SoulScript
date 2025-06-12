import { useCurrentUser } from "./use-current-user"

export function useAuthId() {
    const { user, loading: userLoading } = useCurrentUser()

    return user?.id
}