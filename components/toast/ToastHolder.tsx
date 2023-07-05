import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { cssTransition } from 'react-toastify';
import { useColorTheme } from '@/states/theme';

const MySlide = cssTransition({
  enter: 'my-enter',
  exit: 'my-exit',
  appendPosition: false,
  collapse: true,
  collapseDuration: 300
});

export const ToastHolder = () => {
  const {
    preferredColorTheme: colorScheme,
  } = useColorTheme();

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={1000}
      hideProgressBar
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable={false}
      pauseOnHover
      transition={MySlide}
      toastClassName="modal-backdrop backdrop-blur-lg"
      theme={colorScheme === "light" || colorScheme === "dark" ? colorScheme : undefined}
    />
  );
};
