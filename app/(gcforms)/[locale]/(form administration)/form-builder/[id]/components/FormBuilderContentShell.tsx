"use client";

export const FormBuilderContentShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <main
      id="content"
      className="form-builder my-7 min-h-[calc(100vh-300px)] min-w-0 flex-1"
      tabIndex={-1}
    >
      {children}
    </main>
  );
};
