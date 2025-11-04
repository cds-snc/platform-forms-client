"use client";

export const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="account-wrapper">
      <div className="min-h-[400px] w-[750px] rounded-2xl border-1 border-[#D1D5DB] bg-white p-10">
        <main id="content w-full">
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
};
