import type { CSSProperties, ReactNode } from "react";

export type OnboardingSceneVariant = "rules" | "creation" | "selection";

interface OnboardingSceneProps {
  variant: OnboardingSceneVariant;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

/**
 * Общая сценическая подложка для шагов после авторизации.
 * Арт остаётся главным героем, а интерфейс получает только мягкое стекло,
 * тёплый свет и медленные пылинки — без тяжёлой непрозрачной рамки.
 */
export function OnboardingScene({
  variant,
  children,
  className = "",
  ariaLabel,
}: OnboardingSceneProps) {
  return (
    <main
      className={`onboarding-scene onboarding-scene--${variant} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <div className="onboarding-scene__art" aria-hidden="true" />
      <div className="onboarding-scene__veil" aria-hidden="true" />
      <div className="onboarding-scene__motes" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span
            key={index}
            style={
              {
                "--scene-mote-index": index,
                "--scene-mote-left": `${(index * 29 + 7) % 100}%`,
                "--scene-mote-size": `${1 + (index % 3)}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="onboarding-scene__content">{children}</div>
    </main>
  );
}

export default OnboardingScene;
