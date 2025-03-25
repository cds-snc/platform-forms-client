import debounce from "lodash.debounce";
import * as React from "react";
import { useSwipeable } from "react-swipeable";
import { Transition } from "react-transition-group";
import useEscButton from "./lib/hooks/useEscButton";
import usePreventScroll from "./lib/hooks/usePreventScroll";
import { BackdropStyles, TransitionStyles } from "./lib/styles";
import useGlobalStyles from "./lib/hooks/useGlobalStyles";
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
  nonce?: string;
}

const SlideUpTransition = ({
  isVisible,
  children,
  onClose,
  unmountOnExit = true,
  mountOnEnter = true,
  duration = 250,
  hideScrollbars = false,
  className = "",
  nonce,
}: IProps) => {
  const classNames = useGlobalStyles(duration, hideScrollbars, nonce);
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
              className={clsx(className && `${className}__backdrop`, classNames.backdrop)}
              style={BackdropStyles[state as keyof typeof BackdropStyles] || {}}
              nonce={nonce}
            />
            <div
              className={clsx(className, classNames.drawer)}
              style={{
                ...(TransitionStyles[state as keyof typeof TransitionStyles] || {}),
                ...getTransforms(),
              }}
              nonce={nonce}
            >
              <div
                {...swipeHandlers}
                className={clsx(
                  className && `${className}__handle-wrapper`,
                  classNames.handleWrapper
                )}
              >
                <div className={clsx(className && `${className}__handle`, classNames.handle)} />
              </div>
              <div
                className={clsx(className && `${className}__content`, classNames.contentWrapper)}
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
