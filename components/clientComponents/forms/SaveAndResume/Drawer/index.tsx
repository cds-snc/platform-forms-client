// Code modified from the original source to fit the project's needs
// https://github.com/fpellicero/react-bottom-drawer

import debounce from "lodash.debounce";
import * as React from "react";
import { useSwipeable } from "react-swipeable";
import { Transition } from "react-transition-group";
import useEscButton from "./lib/hooks/useEscButton";
import usePreventScroll from "./lib/hooks/usePreventScroll";
import { BackdropStyles, classNames, TransitionStyles } from "./lib/styles";
import clsx from "clsx";

interface IProps {
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  hideScrollbars?: boolean;
  unmountOnExit?: boolean;
  mountOnEnter?: boolean;
  className?: string;
  backdropClassname?: string;
  children: React.ReactNode;
}

const SlideUpTransition = ({
  isVisible,
  children,
  onClose,
  unmountOnExit = true,
  mountOnEnter = true,
  duration = 250,
}: IProps) => {
  const nodeRef = React.useRef(null);

  // Actions to close
  useEscButton(onClose, isVisible);
  usePreventScroll(isVisible, classNames.contentWrapper);

  // Swiping down interaction
  const [currentDeltaY, setDeltaY] = React.useState(0);
  const swipeHandlers = useSwipeable({
    onSwipedDown: debounce(
      ({ velocity }) => {
        setDeltaY(0);
        if (velocity > 0.5) {
          onClose();
        }
      },
      500,
      { leading: true }
    ),
    onSwiping: ({ deltaY }) => {
      setDeltaY(deltaY);
    },
  });

  const getTransforms = (): React.CSSProperties | undefined => {
    if (currentDeltaY >= 0) {
      return undefined;
    }

    return {
      transform: `translate3d(0, ${currentDeltaY * -1}px, 0)`,
      transition: "none",
    };
  };

  return (
    <>
      <Transition
        appear={true}
        in={isVisible}
        timeout={{ appear: 0, enter: 0, exit: duration }}
        unmountOnExit={unmountOnExit}
        mountOnEnter={mountOnEnter}
        nodeRef={nodeRef}
      >
        {(state) => (
          <div ref={nodeRef}>
            <div
              onClick={onClose}
              className={clsx(
                classNames.backdrop,
                "fixed left-0 top-0 z-10 size-full bg-gray-600/50 transition-opacity duration-[250ms]"
              )}
              style={BackdropStyles[state as keyof typeof BackdropStyles] || {}}
            />
            <div
              className={clsx(
                classNames.drawer,
                "fixed bottom-0 left-0 z-[11] w-screen rounded-t-[15px] bg-white transition-transform duration-[250ms]"
              )}
              style={{
                ...(TransitionStyles[state as keyof typeof TransitionStyles] || {}),
                ...getTransforms(),
              }}
            >
              <div
                {...swipeHandlers}
                className={clsx(classNames.handleWrapper, "flex justify-center px-0 py-2.5")}
              >
                <div
                  className={clsx(classNames.handle, "h-[5px] w-[70px] rounded-[5px] bg-gray-400")}
                />
              </div>
              <div
                className={clsx(
                  classNames.contentWrapper,
                  "max-h-[calc(70vh_-_25px)] overflow-y-auto overflow-x-hidden px-2.5 py-0"
                )}
              >
                {children}
              </div>
            </div>
          </div>
        )}
      </Transition>
    </>
  );
};

export default SlideUpTransition;
