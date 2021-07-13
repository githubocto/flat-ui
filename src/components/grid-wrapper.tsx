import { Global, css } from '@emotion/react';
import { StoreWrapper } from './store-wrapper';

import { Grid, GridProps } from './grid';

function GridWrapper(props: GridProps) {
  return (
    <StoreWrapper>
      <Global
        styles={css`
          *,
          ::before,
          ::after {
            box-sizing: border-box;
          }

          html {
            -moz-tab-size: 4;
            tab-size: 4;
          }

          html {
            line-height: 1.15; /* 1 */
            -webkit-text-size-adjust: 100%; /* 2 */
          }

          body {
            margin: 0;
          }

          body {
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica,
              Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
          }

          hr {
            height: 0; /* 1 */
            color: inherit; /* 2 */
          }

          code,
          kbd,
          samp,
          pre {
            font-family: ui-monospace, SFMono-Regular, Consolas,
              'Liberation Mono', Menlo, monospace; /* 1 */
            font-size: 1em; /* 2 */
          }
          table {
            text-indent: 0; /* 1 */
            border-color: inherit; /* 2 */
          }

          button,
          input,
          optgroup,
          select,
          textarea {
            font-family: inherit; /* 1 */
            font-size: 100%; /* 1 */
            line-height: 1.15; /* 1 */
            margin: 0; /* 2 */
          }

          button,
          select {
            /* 1 */
            text-transform: none;
          }

          button,
          [type='button'],
          [type='reset'],
          [type='submit'] {
            -webkit-appearance: button;
          }

          ::-moz-focus-inner {
            border-style: none;
            padding: 0;
          }

          :-moz-focusring {
            outline: 1px dotted ButtonText;
          }

          :-moz-ui-invalid {
            box-shadow: none;
          }

          ::-webkit-inner-spin-button,
          ::-webkit-outer-spin-button {
            height: auto;
          }

          [type='search'] {
            -webkit-appearance: textfield; /* 1 */
            outline-offset: -2px; /* 2 */
          }

          ::-webkit-search-decoration {
            -webkit-appearance: none;
          }

          ::-webkit-file-upload-button {
            -webkit-appearance: button; /* 1 */
            font: inherit; /* 2 */
          }

          summary {
            display: list-item;
          }

          button {
            background-color: transparent;
            background-image: none;
          }

          fieldset {
            margin: 0;
            padding: 0;
          }

          ol,
          ul {
            list-style: none;
            margin: 0;
            padding: 0;
          }

          html {
            font-family: ui-sans-serif, system-ui, -apple-system,
              BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
              'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
              'Segoe UI Symbol', 'Noto Color Emoji'; /* 1 */
            line-height: 1.5; /* 2 */
          }

          body {
            font-family: inherit;
            line-height: inherit;
          }

          *,
          ::before,
          ::after {
            box-sizing: border-box; /* 1 */
            border-width: 0; /* 2 */
            border-style: solid; /* 2 */
            border-color: currentColor; /* 2 */
          }

          hr {
            border-top-width: 1px;
          }

          img {
            border-style: solid;
          }

          textarea {
            resize: vertical;
          }

          input::placeholder,
          textarea::placeholder {
            opacity: 1;
            color: #9ca3af;
          }

          button,
          [role='button'] {
            cursor: pointer;
          }

          table {
            border-collapse: collapse;
          }

          a {
            color: inherit;
            text-decoration: inherit;
          }

          button,
          input,
          optgroup,
          select,
          textarea {
            padding: 0;
            line-height: inherit;
            color: inherit;
          }

          pre,
          code,
          kbd,
          samp {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
              'Liberation Mono', 'Courier New', monospace;
          }

          img,
          svg,
          video,
          canvas,
          audio,
          iframe,
          embed,
          object {
            display: block; /* 1 */
            vertical-align: middle; /* 2 */
          }
          img,
          video {
            max-width: 100%;
            height: auto;
          }

          *,
          ::before,
          ::after {
            --tw-border-opacity: 1;
            border-color: rgba(229, 231, 235, var(--tw-border-opacity));
          }

          body,
          html,
          #root {
            height: 100%;
          }

          @keyframes yScaleIn {
            0% {
              transform: scaleY(0);
            }
            100% {
              transform: scaleY(1);
            }
          }

          .y-scale-in {
            animation: yScaleIn 0.4s ease-out;
          }

          @keyframes fadeUpIn {
            0% {
              opacity: 0;
              transform: translateY(3em);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .fade-up-in {
            animation: fadeUpIn 0.4s ease-out;
          }
          @keyframes fadeUpSmIn {
            0% {
              opacity: 0;
              transform: translateY(0.6em);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .fade-up-sm-in {
            animation: fadeUpSmIn 0.4s ease-out;
          }

          .html-histogram__thumb {
            opacity: 0;
            transition: opacity 0.3s ease-out;
          }
          .html-histogram:focus-within .html-histogram__thumb,
          .html-histogram:hover .html-histogram__thumb {
            opacity: 1;
          }
          .html-histogram:not(:hover):not(:focus-within)
            .html-histogram__range--base {
            transform: scaleY(
              0.3
            ) !important; /* please forgive me! react-range made me do it */
            transition: all 0.3s ease-out;
          }
          .html-histogram__numbers {
            transition: transform 0.3s ease-out;
          }
          .html-histogram__numbers {
            transform: translateY(-0.8em);
          }
          .html-histogram:focus-within .html-histogram__numbers,
          .html-histogram:hover .html-histogram__numbers {
            transform: none;
          }

          .cell a {
            /* @apply text-indigo-500; */
            text-decoration: underline;
          }

          .cell:hover {
            /* to get around an inline style */
            z-index: 50 !important;
          }

          .cell:hover .cell__long-value {
            pointer-events: all;
          }

          .header__title {
            right: 0;
            min-width: 100%;
            z-index: 50;
          }

          .header:not(:hover) .header__title {
            box-shadow: none;
          }
          .header:hover .header__title {
            right: auto;
          }
          .header__pin {
            opacity: 0;
          }

          .header:hover .header__pin {
            opacity: 1;
          }

          .sticky-grid__header:hover {
            z-index: 150 !important;
          }
          .sticky-grid__header:focus-within {
            z-index: 160 !important;
          }

          @media (max-width: 700px) {
            .pin {
              display: none;
            }
          }
        `}
      />
      <Grid {...props} />
    </StoreWrapper>
  );
}

export { GridWrapper };
