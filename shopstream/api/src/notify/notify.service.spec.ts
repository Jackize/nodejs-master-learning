import { NotifyService } from './notify.service';

describe('NotifyService', () => {
  it('handleOrderPaid lưu recent', () => {
    const svc = new NotifyService();
    svc.handleOrderPaid({
      orderId: 'o1',
      userId: 'u1',
      total: 10,
      status: 'paid',
      paidAt: '2026-01-01T00:00:00.000Z',
    });
    expect(svc.getRecent()).toHaveLength(1);
    expect(svc.getRecent()[0].orderId).toBe('o1');
  });
});
