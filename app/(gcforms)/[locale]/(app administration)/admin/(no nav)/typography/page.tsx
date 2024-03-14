const Heading = ({ title }: { title: string }) => {
  return (
    <h2 className="my-4 border-y-1 border-slate-700 bg-slate-50 py-4 text-center text-2xl font-bold">
      {title}
    </h2>
  );
};

export default async function Page() {
  return (
    <>
      <h1>Typography Preview</h1>
      <Heading title="Public forms + pages" />
      <div className="gc-formview">
        <p className="mb-4">Default (base) text size (20px) Noto Sans</p>

        <p className="mb-4 font-lato">
          <strong>Heading font</strong>: Lato
        </p>
        <h1>H1 Heading (small: 34px, bold; large: 38px bold;)</h1>
        <h2>H2 Heading (small: 32px, bold; large: 36px bold;)</h2>
        <h3>H3 Heading (small: 24px, bold; large: 24px bold;)</h3>
        <h4>H4 Heading (small: 22px, bold; large: 22px bold;)</h4>
        <h5>H5 Heading (small: 20px, bold; large: 20px bold;)</h5>
        <h6>H6 Heading (small: 19px, normal; large: 19px normal;)</h6>
      </div>

      <Heading title="Form builder + Admin" />
      <p className="mb-4">Default (base) text size (18px) Noto Sans</p>
      <p className="mb-4 font-noto-sans">
        <strong>Heading font</strong>: Noto Sans
      </p>

      <h1>H1 Heading (font-semibold small: text-3xl large: text-4xl)</h1>
      <h2>H2 Heading (font-semibold small: text-2xl large: text-3xl)</h2>
      <h3>H3 Heading (font-semibold small: text-xl large: text-2xl)</h3>
      <h4>H4 Heading (font-semibold small: text-lg large: text-xl)</h4>
      <h5>H5 Heading (font-normal small: text-base large: text-lg)</h5>

      <Heading title="Text sizes" />
      <p className="text-xs">text-xs</p>
      <p className="text-sm">text-sm *</p>
      <p className="text-base">text-base *</p>
      <p className="text-lg">text-lg</p>
      <p className="text-xl">text-xl</p>
      <p className="text-2xl">text-2xl</p>
      <p className="text-3xl">text-3xl</p>
      <p className="text-4xl">text-4xl</p>
      <p className="text-5xl">text-5xl</p>
      <p className="text-6xl">text-6xl</p>
      <p className="text-7xl">text-7xl</p>
      <p className="text-8xl">text-8xl</p>
      <p className="text-9xl">text-9xl</p>
      <p className="mt-4">* = customized (not tailwind default)</p>

      <Heading title="Font weights" />
      <p className="font-thin">font-thin</p>
      <p className="font-extralight">font-extralight</p>
      <p className="font-light">font-light</p>
      <p className="font-normal">font-normal</p>
      <p className="font-medium">font-medium</p>
      <p className="font-semibold">font-semibold</p>
      <p className="font-bold">font-bold</p>
      <p className="font-extrabold">font-extrabold</p>
      <p className="font-black">font-black</p>

      <Heading title="Lists" />
      <p>Unordered list</p>
      <ul>
        <li>List item</li>
        <li>List item</li>
      </ul>

      <p>Ordered list</p>
      <ol>
        <li>List item</li>
        <li>List item</li>
      </ol>
      <hr />
    </>
  );
}
