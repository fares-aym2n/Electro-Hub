import {
  ILike,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  MoreThan,
} from 'typeorm';

export const filterObj = (
  name?: string,
  minPrice?: string,
  maxPrice?: string,
  category?: string,
  discount?: string,
) => {
  const cleanName = name ? name.trim() : '';
  const searchPattern = cleanName
    ? `%${cleanName.toLowerCase().replace(/\s+/g, '%')}%`
    : '';

  return {
    ...(cleanName ? { name: ILike(searchPattern) } : {}),
    ...(minPrice && maxPrice
      ? {
          price: Between(parseInt(minPrice), parseInt(maxPrice)),
        }
      : minPrice
        ? { price: MoreThanOrEqual(parseInt(minPrice)) }
        : maxPrice
          ? { price: LessThanOrEqual(parseInt(maxPrice)) }
          : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(discount === 'true' ? { discount: MoreThan(0) } : {}),
  };
};
