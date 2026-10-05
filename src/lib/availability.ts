import type { Cv, ResolvedLabels } from '../config';

export const AVAILABILITY_KEYS = ['format', 'employment', 'salary', 'start'] as const;

export type AvailabilityKey = (typeof AVAILABILITY_KEYS)[number];

export type AvailabilityRow = {
  readonly key: AvailabilityKey;
  readonly label: string;
  readonly value: string;
};

/** Заполненные поля доступности с подписями, в фиксированном порядке. Пустые пропускаются. */
export const buildAvailabilityRows = (
  availability: Cv['availability'],
  labels: ResolvedLabels['availability']
): readonly AvailabilityRow[] =>
  AVAILABILITY_KEYS.flatMap((key): readonly AvailabilityRow[] => {
    const value = availability?.[key];
    return value === undefined || value === '' ? [] : [{ key, label: labels[key], value }];
  });
