export interface Model {
  name: string;
  quality: number;
}

export function route(models: Model[], minQuality: number): { name: string; escalated: boolean } {
  for (let i = 0; i < models.length; i++) {
    if (models[i].quality >= minQuality) {
      return { name: models[i].name, escalated: i > 0 };
    }
  }
  const last = models[models.length - 1];
  return { name: last.name, escalated: true };
}
