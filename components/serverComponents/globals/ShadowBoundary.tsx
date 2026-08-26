export function CMSBoundary({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <template shadowrootmode="open" suppressHydrationWarning={true}>
        <div className="rounded-lg border border-blue-500 bg-slate-100 p-6" />
      </template>
      {children}
    </div>
  );
}
