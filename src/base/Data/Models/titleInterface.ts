export default class TitleInterface<T extends string | number> {
  id: number;
  title?: string;
  subtitle?: T;
  kpi?: string;
  decodedData?: string = "";
  text?: string;
  children?: TitleInterface<T>[];

  constructor({
    id,
    title,
    subtitle,
    kpi,
    decodedData = "",
    text = "",
    children,
  }: {
    id: number;
    title?: string;
    subtitle?: T;
    kpi?: string;
    decodedData?: string;
    text?: string;
    children?: TitleInterface<T>[];
  }) {
    this.id = id;
    this.title = title;
    this.subtitle = subtitle;
    this.kpi = kpi;
    this.decodedData = decodedData;
    this.text = text;
    this.children = children;
  }
}
