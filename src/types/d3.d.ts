declare module "d3-format" {
  export function format(specifier: string): (n: number) => string;
}

declare module "d3-scale" {
  export function scaleLinear(): {
    domain(v: number[]): any;
    nice(): any;
  };
}
