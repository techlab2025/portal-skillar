export default class ShowplacementModel {
  public readonly id?: number;

  constructor(data: { id?: number }) {
    this.id = data.id;

    Object.freeze(this);
  }

  static fromJson(json: any): ShowplacementModel {
    if (!json) {
      throw new Error('Cannot create placementModel from null or undefined');
    }

    return new ShowplacementModel({
      id: json.id,
    });
  }

  static example: ShowplacementModel = new ShowplacementModel({
    id: 1,
  });
}
