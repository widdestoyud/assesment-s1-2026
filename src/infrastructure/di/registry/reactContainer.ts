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
    useState: asValue(useState),
    useEffect: asValue(useEffect),
    useCallback: asValue(useCallback),
    useMemo: asValue(useMemo),
    useContext: asValue(useContext),
    useRef: asValue(useRef),
  });
}

export interface ReactContainerInterface {
  useState: typeof useState;
  useEffect: typeof useEffect;
  useCallback: typeof useCallback;
  useMemo: typeof useMemo;
  useContext: typeof useContext;
  useRef: typeof useRef;
}
