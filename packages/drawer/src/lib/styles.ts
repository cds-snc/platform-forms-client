export const TransitionStyles = {
  entering: { transform: "translate3d(0, 100%, 0)" },
  entered: { transform: "none" },
  exiting: { transform: "translate3d(0, 100%, 0)" },
  exited: { display: "none" },
};

export const BackdropStyles = {
  entering: { opacity: "0" },
  entered: { opacity: "1" },
  exiting: { opacity: "0" },
  exited: { display: "none" },
};

export interface ICustomizations {
  duration: number;
  hideScrollbars: boolean;
}

export const getClassNames = (identifier: string) => ({
  backdrop: `rbd-${identifier}-db`,
  drawer: `rbd-${identifier}-dr`,
  handleWrapper: `rbd-${identifier}-hw`,
  handle: `rbd-${identifier}-h`,
  contentWrapper: `rbd-${identifier}-cw`,
});

const globalStylesheet = (
  identifier: string,
  { duration, hideScrollbars }: ICustomizations
) => {
  const classNames = getClassNames(identifier);
  return `
  .${classNames.backdrop} {
    position: fixed;
    z-index: 10;
    background: rgba(0, 0, 0, 0.5);
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    transition: opacity ${duration}ms;
  }
  .${classNames.drawer} {
    position: fixed;
    z-index: 11;
    left: 0;
    bottom: 0;
    width: 100vw;
    background: white;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    transition: transform ${duration}ms;
  }
  .${classNames.handleWrapper} {
    display: flex;
    justify-content: center;
    padding: 10px 0;
  }
  .${classNames.handle} {
    background: #e3e3e3;
    height: 5px;
    width: 70px;
    border-radius: 5px;
  }
  .${classNames.contentWrapper} {
    padding: 0 10px;
    max-height: calc(70vh - 25px);
    overflow-x: hidden;
    overflow-y: auto;
    ${
      hideScrollbars
        ? `
      scrollbar-width: none;
      -ms-overflow-style: none;
    `
        : ""
    }
  }
  ${
    hideScrollbars
      ? `
  .${classNames.contentWrapper}::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
  `
      : ""
  }
    
`
    .split("\n")
    .map((l) => l.trim())
    .join("");
};
export default globalStylesheet;
