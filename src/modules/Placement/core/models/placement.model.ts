export default class placementModel {
  public readonly id?: number;

  constructor(data: { id?: number }) {
    this.id = data.id;

    Object.freeze(this);
  }

  static fromJson(json: any): placementModel {
    if (!json) {
      throw new Error('Cannot create placementModel from null or undefined');
    }

    return new placementModel({
      id: json.id,
    });
  }

  static example: placementModel = new placementModel({
    id: 1,
  });
}
