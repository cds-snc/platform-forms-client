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

export const classNames = {
  backdrop: "drawer-backdrop",
  drawer: "drawer",
  handleWrapper: "drawer-handle-wrapper",
  handle: "drawer-handle",
  contentWrapper: "drawer-content-wrapper",
};
