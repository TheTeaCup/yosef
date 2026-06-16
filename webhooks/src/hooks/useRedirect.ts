import { useRouter } from "next/navigation";

export function useRedirect() {
  const router = useRouter();

  return (path: string) => {
    router.push(path);
  };
}
