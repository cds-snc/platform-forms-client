export const getRedisInstance = vi.fn().mockResolvedValue({
  pipeline: vi.fn().mockReturnValue({
    incr: vi.fn(),
    expire: vi.fn(),
    exec: vi.fn().mockResolvedValue([[null, 0]]),
  }),
});
