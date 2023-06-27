type MultipleButtonItem<T> = {
  key: T;
  title: string;
  hint?: string;
};

type MultipleButtonProps<T> = {
  items: MultipleButtonItem<T>[];
  currentKey?: T;
  onClick: (item: MultipleButtonItem<T>) => void;
};

export function MultipleButtons<T extends string>({
  items,
  currentKey,
  onClick,
}: MultipleButtonProps<T>) {
  const buttons = items.map(item => {
    const isActive = currentKey === item.key;
    return <button
      key={item.key}
      className={`multiple-buttons-button ${isActive ? "active" : ""}`}
      title={item.hint}
      onClick={() => onClick(item)}
    >
      {item.title}
    </button>
  });

  return <div className="multiple-buttons">{ buttons }</div>;
}

