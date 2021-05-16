export interface CanSerialize<T = any, Model = any> {
  morph(data: T): Model
}

export type SerializerResolve = CanSerialize | Function
