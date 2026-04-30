import { AwilixContainer, asValue } from 'awilix';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export function registerReactModules(container: AwilixContainer) {
  container.register({
    useEffect: asValue(useEffect),
    useState: asValue(useState),
    useRef: asValue(useRef),
    useContext: asValue(useContext),
    useCallback: asValue(useCallback),
    useMemo: asValue(useMemo),
  });
}

export interface ReactContainerInterface {
  useEffect: typeof useEffect;
  useState: typeof useState;
  useRef: typeof useRef;
  useContext: typeof useContext;
  useCallback: typeof useCallback;
  useMemo: typeof useMemo;
}
