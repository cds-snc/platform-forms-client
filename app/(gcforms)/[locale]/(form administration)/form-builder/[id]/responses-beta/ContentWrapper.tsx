"use client";

export const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="account-wrapper">
      <div className="w-[750px] rounded-2xl border-1 border-[#D1D5DB] bg-white px-10 py-8">
        <main id="content w-full">
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
};
