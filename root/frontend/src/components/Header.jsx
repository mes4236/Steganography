function Header() {
  return (
    <div className="flex flex-col w-full sm:flex-row items-center justify-center p-3 bg-slate-800 gap-2">
      <h1 className="font-bold text-lg lg:text-xl font-sans pt-3 sm:pt-0 text-slate-200 mr-auto">
        Steganography project demo.
      </h1>

      <div className="ml-auto flex items-end p-2">
        <a
          href="https://github.com/dhirajmourya332/steganography"
          target="_blank"
          rel="noopner noreferrer"
          className="px-3 py-1 border border-slate-200 text-slate-200 rounded-md hover:bg-slate-200 hover:text-black"
        >
          {"Source code"}
        </a>
      </div>
    </div>
  );
}

export default Header;
