type MultipleButtonItem<T> = {
  key: T;
  hint?: string;
  title?: string;
  content?: JSX.Element;
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
    item
    return <button
      key={item.key}
      className={`multiple-buttons-button ${isActive ? "active" : ""}`}
      title={item.hint}
      onClick={() => onClick(item)}
    >
      {item.content ? item.content : item.title || null}
    </button>
  });

  return <div className="multiple-buttons">{ buttons }</div>;
}

