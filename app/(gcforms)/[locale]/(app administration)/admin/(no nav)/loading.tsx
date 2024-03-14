import { Loader } from "components/clientComponents/globals/Loader";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader />
    </div>
  );
}
