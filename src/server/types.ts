export type StoredUser = {
  id: string;
  nome: string;
  email: string;
  passwordHash: string;
  createdAt: string; // ISO
};

export type CommunityMembership = {
  userId: string;
  slug: string; // community slug
  joinedAt: string; // ISO
};

export type DBShape = {
  users: StoredUser[];
  memberships: CommunityMembership[];
};
